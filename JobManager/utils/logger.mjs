class Logger{
    #logs=[];
    log(type,message,details){
        let logRecord={
            timestamp : new Date().toISOString(),       // timestamp in human readable string form
            type,
            message,
            ...details
        };
        this.#logs.push(logRecord);
    }
    getLogs(filterType){                                // return logs
        if(!filterType) return [...this.#logs];
        return this.#logs.filter((log)=>log.type===filterType);
    }
    getLogCount(){                                          // return total log count
        return this.#logs.length;
    }
}

export const logger = new Logger();