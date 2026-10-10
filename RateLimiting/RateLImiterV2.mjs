class RateLimiter{
    #requestSet=new Map();
    #windowMs;
    #limit;

    constructor(limit, windowMs){
        if(!Number.isInteger(limit) || limit<=0) throw new Error("Invalid limit value");
        if(!Number.isInteger(windowMs) || windowMs<=0) throw new Error("Invalid windowMs value");
        this.#limit = limit;
        this.#windowMs = windowMs;
        console.log(`Rate limiter initialized with ${limit}requests/${windowMs}ms!`);
    }
    allowRequest(userId){
        if(typeof userId !== "string" || userId.trim() === "") throw new Error("Invalid userId");

        const currentTimestamp = new Date().getTime();
        const windowStart = currentTimestamp - this.#windowMs; 
        let requests = this.#requestSet.get(userId);

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
                requests[0]+this.#windowMs - currentTimestamp
            );

            this.#requestSet.set(userId,requests);

            return {
                Allowed: false,
                RemainingSlots:0,
                retryBackoff
            }

        }// if can be added;
        requests.push(currentTimestamp);        // add timestamp to requestSet
        this.#requestSet.set(userId,requests);
        return {
            Allowed: true,
            RemainingSlots: this.#limit - requests.length,
            retryBackoff:0
        } 
        

    }
}



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