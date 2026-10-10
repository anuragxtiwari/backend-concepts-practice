class RateLimitor{
    #requestSet={};
    #windowMs;
    #limit;

    constructor(limit, windowMs){
        if(limit<=0 || windowMs<=0) throw new Error("Invalid inputs for initializing ratelimitor!");
        this.#limit = limit;
        this.#windowMs = windowMs;
        console.log("Rate limitor initialized!");
    }
    async allowRequest(userId){
        const currentTS = new Date().getTime();
        try {
            if(!this.#requestSet[userId]) this.#createUserRecord(userId);
            else this.#removeOldRequests(userId,currentTS);
            const requestValid = this.#getRequestValidity(userId);
            if(requestValid) this.#requestSet[userId].push(currentTS);
            await this.#executeRequest(userId);
        } catch (error) {
            console.log(`caught error: ${error}`);
        }


    }
    #createUserRecord(userId){
        const userRecord =[]; 
        this.#requestSet[userId] = userRecord;
        console.log(`Added user:${userId} in requestSet!`)
        return this.#requestSet[userId];
    }
    async #executeRequest(userId){
        await new Promise((resolve)=>{setTimeout(()=>{console.log(`Request approved for user:${userId}`); resolve()},2000)});
    }
    #removeOldRequests(userId,currentTS){
        const windowStartValue = currentTS - this.#windowMs;
        for(const req of this.#requestSet[userId]){
            if(req<windowStartValue) this.#requestSet[userId].shift();
        }
    }
    #getRequestValidity(userId){
        if(this.#requestSet[userId].length<this.#limit) return true;
        throw new Error(`Rate limit reached for ${userId}, try again later!`) 
    }
}

const button1 = document.getElementById("button1");
button1.addEventListener("click",()=>{
    rateLimitor.allowRequest("user1")
})
const button2 = document.getElementById("button2");
button2.addEventListener("click",()=>{
    rateLimitor.allowRequest("user2")
})
const button3 = document.getElementById("button3");
button3.addEventListener("click",()=>{
    rateLimitor.allowRequest("user3")
})

const rateLimitor = new RateLimitor(5,5000);