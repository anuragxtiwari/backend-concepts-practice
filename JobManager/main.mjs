import { JobManager } from "./JobManager.mjs";

const manager = new JobManager(150);        // create a job manager with n concurrency limit

manager.addMultipleJobs(100);               // add n jobs to jobs list

await manager.start();                      // start the execution process
manager.getSummary();                       // get summery of all jobs