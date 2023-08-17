import { ErrorMessage, Field } from 'formik';

interface ToggleInputProps {
  name: string;
  label: string;
}

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
