import * as os from 'os';
import path from 'path';

interface Configuration{
    APIKEY: string | null,
    MODEL: string
    ankiLocation: string
}
export const config: Configuration = {
    APIKEY: null,
    MODEL:  "gpt-4",
    ankiLocation: path.join(os.homedir(),".ImmerseDict","immerseDict.txt")
}
