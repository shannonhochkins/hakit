import { Hono } from 'hono';
import { getUser } from '../kinde';
import { formatErrorResponse } from '../helpers/formatErrorResponse';
import { deleteFile, uploadImage } from '../helpers/upload';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { describeRoute } from 'hono-openapi';

const uploadRoute = new Hono()
  .post(
    '/image',
    describeRoute({
      summary: 'Upload an image',
      description: 'Upload an image file for the authenticated user',
      responses: {
        200: {
          description: 'Image uploaded successfully',
        },
        400: {
          description: 'Upload error or validation failed',
        },
      },
      tags: ['Upload'],
    }),
    getUser,
    async c => {
    try {
      const body = await c.req.parseBody();
      if (!body.file) {
        throw new Error('No file uploaded or wrong file type.');
      }
      if (typeof body.file === 'string') {
        throw new Error('Invalid file');
      }
      const user = c.var.user;
      const file = body.file; // type File

      const filePath = await uploadImage(user.id, file);
      return c.json(
        {
          message: 'File uploaded successfully!',
          filePath,
        },
        200
      );
    } catch (e) {
      return c.json(formatErrorResponse('Upload Image Error', e), 400);
    }
  })
  .delete(
    '/image',
    describeRoute({
      summary: 'Delete an image',
      description: 'Delete an uploaded image file for the authenticated user',
      responses: {
        200: {
          description: 'Image deleted successfully',
        },
        400: {
          description: 'Delete error or validation failed',
        },
      },
      tags: ['Upload'],
    }),
    getUser,
    zValidator(
      'json',
      z.object({
        filePath: z.string(),
      })
    ),
    async c => {
      try {
        const { filePath } = c.req.valid('json');
        await deleteFile(c.var.user.id, filePath);
        return c.json(
          {
            message: 'File deleted successfully!',
          },
          200
        );
      } catch (e) {
        return c.json(formatErrorResponse('Delete Image Error', e), 400);
      }
    }
  );

export default uploadRoute;
