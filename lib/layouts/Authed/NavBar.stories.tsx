import { Meta, StoryObj } from '@storybook/react';
import { NavBar as NavBarEl } from './NavBar';

const meta: Meta<typeof NavBarEl> = {
  component: NavBarEl,
};
export default meta;
type Story = StoryObj<typeof NavBarEl>;

export const NavBar: Story = args => <NavBarEl {...args} />;
NavBar.args = {
  disableNav: false,
};
