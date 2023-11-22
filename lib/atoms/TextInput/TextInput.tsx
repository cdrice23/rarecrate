import { ErrorMessage, Field } from 'formik';
import { TextInputProps } from '@/types/atoms/TextInput.types';

const TextInput = ({ name, placeholder, maxLength, value, onChange, label }: TextInputProps) => {
  return (
    <>
      <label>
        <h4>{label}</h4>
      </label>
      <Field name={name} placeholder={placeholder} maxLength={maxLength} value={value} onChange={onChange} />
      <ErrorMessage name={name} />
    </>
  );
};

export { TextInput };
