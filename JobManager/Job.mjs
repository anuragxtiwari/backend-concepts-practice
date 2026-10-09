export class Job{
    //properties
    #id;
    #task;
    #status="pending";
    #result=null;
    #error=null;
    #maxRetries;
    #currentAttempt = 0;
    //constructor
    constructor(id,task,maxRetries=3){
        this.#id = id;
        this.#task = task;
        this.#maxRetries = maxRetries;
    }
    //methods
    getId(){
        return this.#id;
    }
    getTask(){
        return this.#task;
    }
    getStatus(){
        return this.#status;
    }
    setStatus(status){
        this.#status=status;
    }
    getResult(){
        return this.#result;
    }
    setResult(res){
        this.#result = res;
    }
    getCurrentAttempt(){
        return this.#currentAttempt;
    }
    updateCurrentAttempt(){
        this.#currentAttempt++;
    }
    getMaxRetries(){
        return this.#maxRetries;
    }
    getError(){
        return this.#error;
    }
    setError(error){
        this.#error=error;
    }
}