import { GPTExplainer } from '../src/main/explainer';
import { config } from '../src/main/config';
import { handleTranslate } from '../src/main/translator';


describe('testing chatGPT explainer', () => {
    test('integration test: get result from chatGPT', async () => {
        // if (!process.env.CHATGPT_KEY) {
        //     logger.error("No CHATGPT_KEY environment variable for the test process, cannot test")
        //     return
        // }
        // config.APIKEY = process.env.CHATGPT_KEY!
        config.APIKEY = "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"
        const explainer = new GPTExplainer("Cruise passengers return to port in Charleston and find their cars flooded", ["Cruise"])
        const explain = await explainer.getExplanation()
        expect(explain !== null).toBe(true);
    });
});

describe('testing google translator', () => {
    test('integration test: get result from google translator', async () => {
        const result = await handleTranslate(null,"Cruise passengers return to port in Charleston and find their cars flooded")
        console.log(result)
        expect(result.status).toBe(200);
    });
});