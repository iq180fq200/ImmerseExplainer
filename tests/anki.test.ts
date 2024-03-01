import { handleAddFlashcard } from '../src/main/anki';

describe('testing add to anki', () => {
  test('unit test: add a note to anki', async () => {
    const result = await handleAddFlashcard(null,"Cruise passengers return to port in Charleston and find their cars flooded", [1,2],"test", "test", true)
    console.log(result)
  });
});