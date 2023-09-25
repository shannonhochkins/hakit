import AceEditor from 'react-ace';
import { trpc } from '../utils/trpc';
import { FC,  useState, useRef } from 'react';
import { Column, Row } from '@hakit/components';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-solarized_dark';

export const TestService: FC = () => {
  const editorRef = useRef<AceEditor['editor']>();
  const [inputDataset, setInputDataset] = useState<null | string>(process.env.SUPERVISOR_TOKEN ?? 'unknown');
  const FileApi = trpc.Files.write.useMutation();

  return (
    <>
      <Column
        gap="1rem"
        wrap="nowrap"
        fullWidth
      >
        <Row fullWidth>
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
                  FileApi.mutate({
                    text: inputDataset,
                    filename: 'absfilename',
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
        </Row>
      </Column>
    </>
  );
};
