import { Form, Formik } from 'formik';
import { TextInput } from '@/lib/atoms/TextInput/TextInput';
import { crateFormSchema } from '@/core/helpers/validation';
import { ToggleInput } from '@/lib/atoms/ToggleInput/ToggleInput';
import cx from 'classnames';
import { PillArray } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { LabelSearchInput } from '../LabelSearchInput/LabelSearchInput';

// Needed items
// title - check
// description - check
// labels - check
// isRanked - check
// Albums
// Tags
// order

const onSubmit = async (values, actions) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(values);
  const newLabels = values.labels.filter(label => label.isNew);
  const existingLabels = values.labels.filter(label => !label.hasOwnProperty('isNew'));
  console.log('New labels', newLabels);
  console.log('Existing labels:', existingLabels);

  actions.resetForm();
};

const CrateForm = () => {
  const initialValues = {
    title: '',
    description: '',
    labels: [],
    isRanked: false,
    crateAlbums: [],
  };

  return (
    <Formik initialValues={initialValues} validationSchema={crateFormSchema} onSubmit={onSubmit}>
      {({ errors, touched, values, handleChange, isSubmitting }) => (
        <Form className={cx('crateForm')}>
          <TextInput
            name="title"
            placeholder="Crate Title"
            maxLength={30}
            value={values.title}
            onChange={handleChange}
            label="Crate Title"
          />
          <TextInput
            name="description"
            placeholder="Description of your Crate"
            maxLength={160}
            value={values.description}
            onChange={handleChange}
            label="Description"
          />
          <ToggleInput name="isRanked" label="Ranked?" />
          <LabelSearchInput value={values.labels} />
          <button disabled={isSubmitting} type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export { CrateForm };
