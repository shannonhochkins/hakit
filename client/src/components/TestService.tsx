import AceEditor from 'react-ace';
import { trpc } from '../utils/trpc';
import { FC,  useState, useRef } from 'react';
import { Column, Row } from '@hakit/components';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-solarized_dark';

export const TestService: FC = () => {
  const editorRef = useRef<AceEditor['editor']>();
  const trpcClient = trpc.useContext();
  const [filename, setFilename] = useState<string>('test.txt');
  const [inputDataset, setInputDataset] = useState<null | string>('');
  const writeFile = trpc.Files.write.useMutation();
  const readFile = async (filename: string): Promise<void> => {
    const response = await trpcClient.Files.read.fetch({
      filename,
    });
    console.log('response', response);
  };
  return (
    <>
      <Column
        gap="1rem"
        wrap="nowrap"
        fullWidth
      >
        <Row fullWidth>
          <label>FILENAME</label>
          <input type="text" onChange={(e) => {
            const text = e.target.value;
            setFilename(text);
          }}/>
          <AceEditor
            mode="json"
            width="100%"
            height="350px"
            theme="solarized_dark"
            onLoad={(editor) => {
              editorRef.current = editor as AceEditor['editor'];
            }}
            setOptions={{
              useWorker: false
            }}
            onChange={(val) => {
              setInputDataset(val);
            }}
          />
        </Row>
        <Row fullWidth>
          <button
            disabled={inputDataset === null || inputDataset.length === 0}
            onClick={() => {
              void(async () => {
                if (inputDataset !== null) {
                  writeFile.mutate({
                    text: inputDataset,
                    filename,
                  }, {
                    onError(error) {
                      console.log('error', error);
                    },
                  });
                }
              })();
            }}
          >
            WRITE FILE
          </button>
          <button
            disabled={inputDataset === null || inputDataset.length === 0}
            onClick={() => {
              void(async () => {
                await readFile(filename);
              })();
            }}
          >
            READ FILE
          </button>
        </Row>
      </Column>
    </>
  );
};
