import { Hono} from 'hono';

const uploadRoute = new Hono()
  .post('/image', async (c) => {
    const body = await c.req.parseBody();
    if (!body.file) {
      return c.json({ message: 'No file uploaded or wrong file type.' }, 400);
    }
    console.log('file', body.file);
    c.json({
      message: 'File uploaded successfully!',
      filename: body.file,
    }, 200);
  });

export default uploadRoute;
