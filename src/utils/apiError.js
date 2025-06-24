class ApiError extends Error{
    constructor(statuscode,message,error=[],stack=''){   // stack is for debugging purposes
        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.success = false;
        this.error = error;
        this.stack = stack;
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor); //capture the stack trace for an error object
        }
    }
    
}

export {ApiError}