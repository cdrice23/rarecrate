import { ErrorMessage, Field } from 'formik';
import { ToggleInputProps } from '@/types/atoms/ToggleInput.types';

const ToggleInput = ({ name, label }: ToggleInputProps) => {
  return (
    <>
      <label>
        <h4>{label}</h4>
      </label>
      <Field type="checkbox" name={name} />
      <ErrorMessage name={name} />
    </>
  );
};

export { ToggleInput };
