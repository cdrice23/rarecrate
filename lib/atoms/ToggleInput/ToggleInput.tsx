import { ErrorMessage, Field } from 'formik';
import { ToggleInputProps } from '@/lib/atoms/ToggleInput/ToggleInput.types';

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
