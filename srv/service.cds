using {db} from '../db/data-model';

service MyService {

    entity resignation as projection on db.resignation;

}