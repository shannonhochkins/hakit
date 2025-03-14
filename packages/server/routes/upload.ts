import { Hono} from 'hono';
import { getUser } from "../kinde";
import { formatErrorResponse } from "../helpers/formatErrorResponse";
import { uploadFile } from '../helpers/gcloud-file';

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
      const arrayBuffer = await file.arrayBuffer()
      const dataAsUint8Array = new Uint8Array(arrayBuffer); 

      console.log('file', file.type)

      await uploadFile({
        saveData: dataAsUint8Array,
        userId: user.id,
        contentType: file.type,
        suffix: `assets/${body.filename}`,
      })
      return c.json({
        message: 'File uploaded successfully!',
        filename: body.file,
      }, 200);
    } catch (e) {
      return c.json(formatErrorResponse('Upload Asset Error', e), 400);
    }
  });

export default uploadRoute;
