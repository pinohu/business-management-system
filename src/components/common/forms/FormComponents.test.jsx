import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FormComponents from './FormComponents';

const mockStore = configureStore({
  reducer: {
    form: (state = {}, action) => state,
    ui: (state = {}, action) => state,
  },
});

const renderWithRedux = (component) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('FormComponents', () => {
  describe('TextInput', () => {
    it('renders text input with label', () => {
      renderWithRedux(
        <FormComponents.TextInput
          label="Test Label"
          name="test"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('handles input change', () => {
      const handleChange = jest.fn();
      renderWithRedux(
        <FormComponents.TextInput
          label="Test Label"
          name="test"
          value=""
          onChange={handleChange}
        />
      );
      const input = screen.getByLabelText('Test Label');
      fireEvent.change(input, { target: { value: 'test value' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message', () => {
      renderWithRedux(
        <FormComponents.TextInput
          label="Test Label"
          name="test"
          value=""
          onChange={() => {}}
          error="Test error"
        />
      );
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  describe('SelectInput', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];

    it('renders select input with options', () => {
      renderWithRedux(
        <FormComponents.SelectInput
          label="Test Label"
          name="test"
          value=""
          onChange={() => {}}
          options={options}
        />
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('CheckboxInput', () => {
    it('renders checkbox with label', () => {
      renderWithRedux(
        <FormComponents.CheckboxInput
          label="Test Label"
          name="test"
          checked={false}
          onChange={() => {}}
        />
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('handles checkbox change', () => {
      const handleChange = jest.fn();
      renderWithRedux(
        <FormComponents.CheckboxInput
          label="Test Label"
          name="test"
          checked={false}
          onChange={handleChange}
        />
      );
      const checkbox = screen.getByLabelText('Test Label');
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('SubmitButton', () => {
    it('renders submit button with loading state', () => {
      renderWithRedux(
        <FormComponents.SubmitButton
          loading={true}
          disabled={false}
        >
          Submit
        </FormComponents.SubmitButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
 