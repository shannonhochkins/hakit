import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { Alert } from '@components/Alert';

export function StyleguideAlerts() {
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Alert - Severity Variants'>
        <Alert severity='info' title='Information'>
          This is an informational alert with a title and message content.
        </Alert>
        <Alert severity='warning' title='Warning'>
          This is a warning alert that indicates something needs attention.
        </Alert>
        <Alert severity='success' title='Success'>
          This is a success alert indicating a successful operation.
        </Alert>
        <Alert severity='error' title='Error'>
          This is an error alert indicating something went wrong.
        </Alert>
      </Group>

      <Group title='Alert - Without Titles'>
        <Alert severity='info'>This is an informational alert without a title.</Alert>
        <Alert severity='warning'>This is a warning alert without a title.</Alert>
        <Alert severity='success'>This is a success alert without a title.</Alert>
        <Alert severity='error'>This is an error alert without a title.</Alert>
      </Group>

      <Group title='Alert - With Rich Content'>
        <Alert severity='info' title='Rich Content Example'>
          This alert contains <mark>highlighted text</mark> and <code>inline code</code> elements.
        </Alert>
        <Alert severity='warning' title='Code Block Example'>
          Here&apos;s some <code>inline code</code> and a <mark>highlighted section</mark> for emphasis.
        </Alert>
        <Alert severity='success' title='Mixed Content'>
          Success! Your <code>deployment</code> completed successfully. <mark>All tests passed</mark>.
        </Alert>
        <Alert severity='error' title='Error Details'>
          Error in <code>function validateInput()</code>. <mark>Invalid parameters</mark> provided.
        </Alert>
      </Group>

      <Group title='Alert - Clickable Alerts'>
        <Alert severity='info' title='Clickable Alert' onClick={() => alert('Alert clicked!')}>
          This alert is clickable and will show an alert when clicked.
        </Alert>
        <Alert severity='warning' title='Interactive Warning' onClick={() => console.debug('Warning alert clicked')}>
          Click this warning alert to see console output.
        </Alert>
      </Group>

      <Group title='Alert - Custom Styling'>
        <Alert
          severity='info'
          title='Custom Styled Alert'
          style={{
            border: '2px dashed var(--clr-primary-a60)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          This alert has custom inline styles applied.
        </Alert>
        <Alert severity='success' title='Custom Class Alert' className='custom-alert-class'>
          This alert has a custom className applied.
        </Alert>
      </Group>

      <Group title='Alert - Long Content'>
        <Alert severity='warning' title='Long Content Example'>
          This is a longer alert message that demonstrates how the Alert component handles extended content. The text should wrap properly
          and maintain good readability. This is useful for displaying detailed information, instructions, or explanations that require more
          space than a typical short message.
        </Alert>
        <Alert severity='info'>
          This is an even longer alert without a title that contains multiple sentences and demonstrates the component&apos;s ability to
          handle substantial amounts of text while maintaining proper spacing and visual hierarchy. The content should be easy to read and
          well-formatted regardless of length.
        </Alert>
      </Group>

      <Group title='Alert - Complex Nested Content'>
        <Alert severity='error' title='Complex Error Details'>
          <div>
            <p>Multiple issues detected:</p>
            <ul>
              <li>
                Connection timeout in <code>api.service.js</code>
              </li>
              <li>
                Invalid response format from <mark>endpoint /api/users</mark>
              </li>
              <li>Missing authentication token</li>
            </ul>
            <p>
              Please check your <code>network configuration</code> and try again.
            </p>
          </div>
        </Alert>
        <Alert severity='success' title='Installation Complete'>
          <div>
            <p>Successfully installed the following components:</p>
            <ul>
              <li>
                <code>@hakit/ui</code> - Version 2.1.0
              </li>
              <li>
                <code>@hakit/utils</code> - Version 1.5.2
              </li>
              <li>
                <code>@hakit/icons</code> - Version 3.0.1
              </li>
            </ul>
            <p>
              All dependencies are now <mark>up to date</mark> and ready to use.
            </p>
          </div>
        </Alert>
      </Group>

      <Group title='Alert - Edge Cases'>
        <Alert severity='info' title=''>
          Alert with empty title string.
        </Alert>
        <Alert severity='warning'>{null}</Alert>
        <Alert severity='error' title='Empty Content'>
          {''}
        </Alert>
        <Alert severity='success' title='Special Characters'>
          Alert with special characters: !@#$%^&*()_+-
        </Alert>
      </Group>

      <Group title='Alert - Accessibility Examples'>
        <Alert severity='info' title='Accessible Alert'>
          This alert has proper ARIA attributes and semantic HTML structure for screen readers.
        </Alert>
        <Alert severity='warning' title='Focusable Alert' onClick={() => alert('Accessible alert clicked')} style={{ cursor: 'pointer' }}>
          This clickable alert maintains proper focus management and keyboard navigation.
        </Alert>
      </Group>
    </Column>
  );
}
