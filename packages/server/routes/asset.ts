import { Hono} from 'hono';
import { getUser } from "../kinde";
import { formatErrorResponse } from "../helpers/formatErrorResponse";

const assetRoute = new Hono()
  .post('/asset/:objectKey', getUser, async (c) => {
    const body = await c.req.parseBody();
    if (!body.file) {
      // return c.json(formatErrorResponse('Retrieve Asset Error', 'No file uploaded or wrong file type.'), 400);
    }
    c.json({
      message: 'File uploaded successfully!',
      filename: body.file,
    }, 200);
  });

export default assetRoute;
