import { Job } from "./Job.mjs";
import { logger } from "./utils/logger.mjs";
import { BACKOFF_DELAY } from "./config/constants.mjs";
export class JobManager {
    #jobs = []; // to store all the jobs
    #pendingJobs = [];  // to store pending jobs in queue

    #concurrencyLimit;  // max jobs that can work at a time
    #activeJobs = 0;    // count of jobs working now
    #retryWaiting = 0;  // jobs waiting for retry

    #started = false;   // start() called or not

    #completionPromise;    // stores the final promise of start()
    #resolveCompletion;     // stores the resolve function of completion promise

    #finished = 0;      // count of jobs finished
    #failed = 0;        // count of jobs failed

    constructor(concurrenyLimit) {     // job manager constructor
        if (concurrenyLimit > 0) this.#concurrencyLimit = concurrenyLimit;
        else throw new Error("Invalid concurrency limit!");

    }
    addJob(job, delay) {     // method to add a new job to jobs list
        if (this.#started) throw new Error("Cannot add job after calling start() !")    // check if start() is already called
        this.#jobs.push(job);                                                           // else, push job to jobs list
        console.log(`new job added : ${job.getId()} with delay: ${delay}`)              // console.log kardo
    }

    addMultipleJobs(num) {                                                              // function to create multiple jobs and push via addJOB(), one at a time 
        if (this.#started) throw new Error("Cannot add job after calling start() !")
        for (let i = 1; i <= num; i++) {                                                // loop upto n times
            let id = `a${100 + i}`;                                                    // id of job
            let delay = Math.floor((Math.random() * 4) * 1000 + 1000);                // random delay taken by job to finish
            let task = async () => {                                                     // task() of job to perform 
                await new Promise((resolve) => { setTimeout(resolve, delay) });     // returns a promise, that resolves after 'delay' duration
                if (Math.random() < 0.3) throw new Error(`Task ${id} failed`);      // a failure probabilty, if true, fail the task temporarily
                console.log(`Job:${id} completed after ${delay}ms`);                // else, console.log completion message
            }
            this.addJob(new Job(id, task), delay);                                     // add job to job list
        };
    }

    start() {             //responsible for initializing pendingJobList             // start() to start the execution of jobs
        if (this.#started) throw new Error("start() can only be called once!");     // check if start() is not working already

        this.#started = true;                                                       // else, mark tag to true

        if (this.#jobs.length === 0) throw new Error("No job to start");            // if no task in job list, return error

        this.#pendingJobs = [...this.#jobs];                                        // initialize pending jobs list with all the elements
        
        // it is what makes start() keep await till all jobs are complete
        this.#completionPromise = new Promise((resolve) => {                        // store the completion promise of start() 
            this.#resolveCompletion = resolve;                                      // also store the resolve() method
        })

        this.#pump()                                                                // call pump() to check if a new job can be executed or not
        this.#checkCompletion();                                                    // check the completion of start()

        return this.#completionPromise;                                               // return the completion promise of start()          

    }
    #pump() {         // rspnsible for executing jobs == concurencyLimit                     // method to check if a new job can be executed from pending jobs list
        while (this.#activeJobs < this.#concurrencyLimit && this.#pendingJobs.length > 0) {   // while activejobs count is lesser than Concurrentlimit, keep
            const job = this.#pendingJobs.shift();      // fetch a job from front of queue
            this.#activeJobs++;                 // increment activeJob count
            this.#executeJob(job);              // execute the fetched job
        }
        this.#checkCompletion();            // check if all jobs are completed
    }

    async #executeJob(job) {               // method to execute a job
        job.setStatus('running');           // set status to 'running'
        job.updateCurrentAttempt();         // update its attempt
                                                                                                //log and store the log
        logger.log('JOB_STARTED', `job ${job.getId()} started running!`, { 'Attempt': job.getCurrentAttempt() });

        try {                                       // try to execute the task
            const result = await job.getTask()();       // if executed sucessfully, store the result
            job.setStatus("completed");             // set status to completed
            job.setResult(result);                // set result value

            this.#finished++;                   // increment finished Job count 
            logger.log('JOB_FINISHED', `job ${job.getId()} finished!`, { 'Attempt': job.getCurrentAttempt() }); // log and store log


        } catch (error) {                                       // catch and do things, if error raised while executing task
            let usedRetries = job.getCurrentAttempt() - 1;      // check the tries used
            let canRetry = usedRetries < job.getMaxRetries();   // can we give it one more try??

            if (canRetry) {                                 // if yes, do this
                job.setStatus("pending")                          // set status to pending again
                this.#retryWaiting++;                             // increment retry waiting job count

                const delay = BACKOFF_DELAY * (2 ** (job.getCurrentAttempt() - 1));     // calculate delay duration before retry

                logger.log('JOB_RETRY', `job ${job.getId()} is retrying after ${delay}ms`);   // log and store log

                setTimeout(() => {                      //  do these after delay duration ends..
                    this.#retryWaiting--;                           //decrease retry waiting job count                
                    this.#pendingJobs.push(job);                    // push the job back to pending jobs list
                    this.#pump();                                   //pump the execution again
                }, delay)
            } else {                                    //if we can not try again, do this
                job.setStatus('failed');                        // set job status to failed 
                job.setError(error.message);                    // set its error message
                this.#failed++;                                 // incremenet failed jobs count                        // log and store log
                logger.log(`JOB_FAILED`, `job ${job.getId()} failed permanently!`, { attempts: job.getCurrentAttempt(), error: error.message });
            }
        } finally {                                   // after all this, finally do this
            this.#activeJobs--;                                // decrease the active jobs count
            this.#pump();                                      // pump again
        }
    }

    #checkCompletion() {                            // method to check if all jobs are finished
        const allDone = this.#pendingJobs.length === 0 && this.#retryWaiting === 0 && this.#activeJobs === 0;    // no pending, active, or retry job is left

        if (allDone && this.#resolveCompletion) {       // if all condition satisfied, do this..
            const resolve = this.#resolveCompletion;        // get back the resolve method
            this.#resolveCompletion = null;                     // set it to null
            resolve(this.#createSummary);                           // resolve the completionPromise with summary
        }

    }

    #createSummary() {                              // method to create a summary as json
        return {
            Total: this.#jobs.length,
            Finished: this.#finished,
            Failed: this.#failed,
            Jobs: this.#jobs.map((job) => ({
                id: job.getId(),
                status: job.getStatus(),
                attempts: job.getCurrentAttempt(),
                result: job.getResult,
                error: job.getError()

            }))

        }
    }
    getSummary() {                              // public method to get summary
        const summary = this.#createSummary();
        console.log(`Total jobs: ${summary.Total}`);
        console.log(`Finished jobs: ${summary.Finished}`);
        console.log(`Failed jobs: ${summary.Failed}`);
        console.log(`Log count: ${logger.getLogCount()}`);

        console.log(
            "\nJob details:\n",
            JSON.stringify(summary.Jobs, null, 2)
        )

        // console.log(
        //     "\nLog details:\n",
        //     JSON.stringify(logger.getLogs(), null, 2)
        // )
        return summary;
    }
}