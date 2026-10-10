class RateLimiter{
    #requestSet=new Map();  // map<userId,requests>
    #windowMs;      // limit time duration
    #limit;         // limit of requests

    constructor(limit, windowMs){           // construct a rate limiter object with a limit duration and requests
        if(!Number.isInteger(limit) || limit<=0) throw new Error("Invalid limit value");
        if(!Number.isInteger(windowMs) || windowMs<=0) throw new Error("Invalid windowMs value");
        this.#limit = limit;
        this.#windowMs = windowMs;
        console.log(`Rate limiter initialized with ${limit}requests/${windowMs}ms!`);
    }

    allowRequest(userId){                                                                   // method to check if current request will be accepted or rejected
        if(typeof userId !== "string" || userId.trim() === "") throw new Error("Invalid userId");   // userId validation

        const currentTimestamp = new Date().getTime();              // get current ms timestamp
        const windowStart = currentTimestamp - this.#windowMs;      // valid window's initial timestamp
        let requests = this.#requestSet.get(userId);                // requests list []

        if(!requests) requests = [];    // if no request is stored, initialize the list;

        // if there are old requests, remove them;
        while (requests.length >0 && requests[0]<windowStart){
            requests.shift();
        }

        // check if the request can be added or not;
        if(requests.length>=this.#limit){
            //can not be added to queue
            const retryBackoff = Math.max(
                0,
                requests[0]+this.#windowMs - currentTimestamp       // time left to begin a new window wrt first request's timestamp in queue;
            );

            this.#requestSet.set(userId,requests);      // set the user's request list in request set 

            return {                // return the response
                Allowed: false,
                RemainingSlots:0,
                retryBackoff
            }

        }// if can be added;
        requests.push(currentTimestamp);        // add timestamp to requestSet
        this.#requestSet.set(userId,requests);      // set the user's request list in request set 
        return {
            Allowed: true,                  // return the response
            RemainingSlots: this.#limit - requests.length,
            retryBackoff:0
        } 
        

    }
}


// to test the behavior in web console
const button1 = document.getElementById("button1");
button1.addEventListener("click",()=>{
    console.log(rateLimiter.allowRequest("user1"));
})
const button2 = document.getElementById("button2");
button2.addEventListener("click",()=>{
    console.log(rateLimiter.allowRequest("user2"));
})
const button3 = document.getElementById("button3");
button3.addEventListener("click",()=>{
    console.log(rateLimiter.allowRequest("user3"));
})

const rateLimiter = new RateLimiter(3,5000);
// export the RateLimiter class to use it in main.mjs file;