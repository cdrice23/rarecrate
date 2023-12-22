import { Meta, StoryObj } from '@storybook/react';
import { CrateModal as CrateModalEl } from './CrateModal';
import { NavBar as NavBarEl } from '@/lib/layouts/Authed/NavBar';

const meta: Meta<typeof CrateModalEl> = {
  component: CrateModalEl,
};
export default meta;
type Story = StoryObj<typeof CrateModalEl>;

export const CrateModal: Story = args => (
  <div
    style={{
      // height: 'calc(100vh - 2vw)',
      overflowY: 'scroll',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2vw',
      padding: '1vw',
    }}
  >
    {Array.from({ length: 200 }).map((_, index) => (
      <div
        key={index}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f5f5',
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '200px',
        }}
      >
        {`This is a crate`}
      </div>
    ))}
    <CrateModalEl {...args} />
    <NavBarEl disableNav={false} />
  </div>
);
CrateModal.args = {
  content: <div>{`I am a crate`}</div>,
  show: true,
  onClose: () => {
    console.log('closed!');
  },
};
