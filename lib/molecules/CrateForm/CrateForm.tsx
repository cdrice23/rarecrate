import { Form, Formik, ErrorMessage } from 'formik';
import { TextInput } from '@/lib/atoms/TextInput/TextInput';
import { crateFormSchema } from '@/core/helpers/validation';
import { ToggleInput } from '@/lib/atoms/ToggleInput/ToggleInput';
import cx from 'classnames';
import { LabelSearchInput } from '../LabelSearchInput/LabelSearchInput';
import { CrateAlbumArrayInput } from '../CrateAlbumArrayInput/CrateAlbumArrayInput';
import { useMutation, useLazyQuery } from '@apollo/client';
import {
  ADD_NEW_LABEL,
  SEARCH_LABELS_BY_ID,
  ADD_NEW_TAG,
  SEARCH_TAGS_BY_ID,
  ADD_NEW_ALBUM,
  SEARCH_PRISMA_ALBUMS_BY_ID,
  ADD_NEW_CRATE,
  UPDATE_CRATE,
  GET_CRATE_DETAIL_WITH_ALBUMS,
} from '@/db/graphql/clientOperations';

interface CrateFormProps {
  creatorId: number;
  crateFormData?: any;
  onCloseModal?: () => void;
}

const CrateForm = ({ creatorId, crateFormData, onCloseModal }: CrateFormProps) => {
  const [addNewLabel] = useMutation(ADD_NEW_LABEL);
  const [searchLabelsById] = useLazyQuery(SEARCH_LABELS_BY_ID);
  const [addNewTag] = useMutation(ADD_NEW_TAG);
  const [searchTagsById] = useLazyQuery(SEARCH_TAGS_BY_ID);
  const [addNewAlbum] = useMutation(ADD_NEW_ALBUM);
  const [searchPrismaAlbumsById] = useLazyQuery(SEARCH_PRISMA_ALBUMS_BY_ID);
  const [addNewCrate] = useMutation(ADD_NEW_CRATE);
  const [updateCrate] = useMutation(UPDATE_CRATE);
  const [getCrateDetailWithAlbums] = useLazyQuery(GET_CRATE_DETAIL_WITH_ALBUMS, {
    variables: { id: crateFormData?.id },
  });

  const initialValues = {
    title: '',
    description: '',
    labels: [],
    isRanked: false,
    crateAlbums: [],
  };

  const onSubmit = async (values, actions) => {
    console.log('values', values);
    console.log('crate form values', crateFormData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { title, labels, isRanked, description, crateAlbums } = values;

    // Create or find the Label records
    const labelPromises = labels.map(async label => {
      if (label.hasOwnProperty('id')) {
        return label;
      } else {
        const { data } = await addNewLabel({ variables: { name: label.name } });
        return { ...data.addNewLabel };
      }
    });
    const crateLabels = await Promise.all(labelPromises);

    // Create or find the Tag records
    let tags = [];
    const crateAlbumTags = crateAlbums
      .filter(album => album.tags)
      .map(album => album.tags)
      .flat();
    if (crateAlbumTags) {
      const uniqueTags = new Set(crateAlbumTags.map(tag => JSON.stringify(tag)));
      tags = Array.from(uniqueTags).map((tag: any) => JSON.parse(tag));
    }
    const tagPromises = tags.map(async tag => {
      if (tag.hasOwnProperty('id')) {
        return tag;
      } else {
        const { data } = await addNewTag({ variables: { name: tag.name } });
        return { ...data.addNewTag };
      }
    });
    const crateTags = await Promise.all(tagPromises);

    // Create or find the Album records
    const albumPromises = crateAlbums.map(async album => {
      if (album.hasOwnProperty('id')) {
        return album;
      } else {
        const { data } = await addNewAlbum({ variables: { discogsMasterId: album.discogsMasterId } });
        return { ...data.addNewAlbum };
      }
    });
    const dbCrateAlbums = await Promise.all(albumPromises);

    // Assemble the Crate data using the above created or connected albums, labels, and tags
    const crateInput = {
      id: crateFormData ? crateFormData.id : null,
      title,
      description,
      isRanked,
      creatorId,
      labelIds: crateLabels.map(label => label.id),
      crateAlbums: crateAlbums.map(album => ({
        albumId: album.id ?? dbCrateAlbums.find(dbAlbum => dbAlbum.discogsMasterId === album.discogsMasterId).id,
        tagIds: album.tags
          ? album.tags.map(tag => {
              const crateTag = crateTags.find(crateTag => crateTag.name === tag.name);
              return crateTag ? crateTag.id : null;
            })
          : [],
        order: album.order,
      })),
    };

    console.log('passed crate input data', crateInput);
    // Handle mutation depending on if we're adding a new crate or updating an existing crate
    if (crateFormData) {
      const { data } = await updateCrate({ variables: { input: crateInput } });
      console.log('updated data', data);
    } else {
      const { data } = await addNewCrate({ variables: { input: crateInput } });
      console.log(data);
    }

    getCrateDetailWithAlbums();

    actions.resetForm();
    if (onCloseModal) {
      onCloseModal();
    }
  };

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
      {({ errors, touched, values, handleChange, isSubmitting, resetForm }) => {
        console.log(values);
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
