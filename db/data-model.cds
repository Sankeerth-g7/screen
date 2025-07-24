namespace db;

entity resignation {
    key Jobid : String;
    Date : Date;
    resignationEntries : String;
    seperationPostings : String;
    futureDatedEntries : String;
    upperManagerUpdates : String;
    seperationJobStartTime : Time;
    seperationJobEndTime : Time;
    ueperationJobStatus : String;
    upperManagerJobStartTime : Time;
    upperManagerJobEndTime : Time;
    upperManagerJobStatus : String;
}