import cx from 'classnames';
import { Form, Formik, ErrorMessage } from 'formik';
import { crateFormSchema } from '@/core/helpers/validation';
import { TextInput } from '@/lib/atoms/TextInput/TextInput';
import { ToggleInput } from '@/lib/atoms/ToggleInput/ToggleInput';
import { LabelSearchInput } from '../LabelSearchInput/LabelSearchInput';
import { CrateAlbumArrayInput } from '../CrateAlbumArrayInput/CrateAlbumArrayInput';
import { useCrateFormHandlers, initialValues } from './CrateForm.helpers';

interface CrateFormProps {
  creatorId: number;
  crateFormData?: any;
  onCloseModal?: () => void;
}

const CrateForm = ({ creatorId, crateFormData, onCloseModal }: CrateFormProps) => {
  const { onSubmit, getCrateDetailWithAlbums } = useCrateFormHandlers(creatorId, crateFormData, onCloseModal);

  return (
    <Formik
      initialValues={
        crateFormData
          ? {
              ...crateFormData,
              albums: null,
              crateAlbums: [...crateFormData.albums]
                .sort((a, b) => a.rank - b.rank)
                .map(album => ({ ...album.album, tags: album.tags, order: album.rank })),
            }
          : initialValues
      }
      validationSchema={crateFormSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, isSubmitting, resetForm }) => {
        return (
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
            <ErrorMessage name="labels" component="div" />
            <CrateAlbumArrayInput value={values.crateAlbums} isRanked={values.isRanked} />
            <ErrorMessage name="crateAlbums" component="div" />
            <button disabled={isSubmitting} type="submit">
              Submit
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                resetForm();
                if (onCloseModal) {
                  onCloseModal();
                }
              }}
            >
              Cancel
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

export { CrateForm };
