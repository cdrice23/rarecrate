import { Form, Formik, ErrorMessage } from 'formik';
import { TextInput } from '@/lib/atoms/TextInput/TextInput';
import { crateFormSchema } from '@/core/helpers/validation';
import { ToggleInput } from '@/lib/atoms/ToggleInput/ToggleInput';
import cx from 'classnames';
import { LabelSearchInput } from '../LabelSearchInput/LabelSearchInput';
import { CrateAlbumArrayInput } from '../CrateAlbumArrayInput/CrateAlbumArrayInput';

const onSubmit = async (values, actions) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(values);
  const newLabels = values.labels.filter(label => label.isNew);
  const existingLabels = values.labels.filter(label => !label.hasOwnProperty('isNew'));
  const newAlbums = values.crateAlbums.filter(album => !album.hasOwnProperty('id'));
  const crateAlbumTags = values.crateAlbums
    .filter(album => album.tags)
    .map(album => album.tags)
    .flat();
  console.log(crateAlbumTags);
  let newTags = [];
  let existingTags = [];
  if (crateAlbumTags) {
    const uniqueTags = new Set(crateAlbumTags.map(tag => JSON.stringify(tag)));
    const allTags = Array.from(uniqueTags).map((tag: any) => JSON.parse(tag));
    newTags = allTags.filter(label => label.isNew);
    existingTags = allTags.filter(label => !label.hasOwnProperty('isNew'));
  }

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
          <CrateAlbumArrayInput value={values.crateAlbums} isRanked={values.isRanked} />
          <ErrorMessage name="crateAlbums" component="div" />
          <button disabled={isSubmitting} type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export { CrateForm };
