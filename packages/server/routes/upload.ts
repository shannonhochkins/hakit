import { Hono} from 'hono';
import { getUser } from "../kinde";
import { formatErrorResponse } from "../helpers/formatErrorResponse";
import { uploadImage } from '../helpers/upload';

const uploadRoute = new Hono()
  .post('/image', getUser, async (c) => {
    try {
      const body = await c.req.parseBody();
      if (!body.file) {
        throw new Error('No file uploaded or wrong file type.')
      }
      if (typeof body.file === 'string') {
        throw new Error('Invalid file')
      }
      const user = c.var.user;
      const file = body.file; // type File

      const filePath = await uploadImage(user.id, file);
      return c.json({
        message: 'File uploaded successfully!',
        filePath,
      }, 200);
    } catch (e) {
      return c.json(formatErrorResponse('Upload Image Error', e), 400);
    }
  });

export default uploadRoute;
