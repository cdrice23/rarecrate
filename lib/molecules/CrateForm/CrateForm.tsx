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
} from '@/db/graphql/clientOperations';

const CrateForm = ({ creatorId }) => {
  const [addNewLabel] = useMutation(ADD_NEW_LABEL);
  const [searchLabelsById] = useLazyQuery(SEARCH_LABELS_BY_ID);
  const [addNewTag] = useMutation(ADD_NEW_TAG);
  const [searchTagsById] = useLazyQuery(SEARCH_TAGS_BY_ID);
  const [addNewAlbum] = useMutation(ADD_NEW_ALBUM);
  const [searchPrismaAlbumsById] = useLazyQuery(SEARCH_PRISMA_ALBUMS_BY_ID);
  const [addNewCrate] = useMutation(ADD_NEW_CRATE);

  const initialValues = {
    title: '',
    description: '',
    labels: [],
    isRanked: false,
    crateAlbums: [],
  };

  const onSubmit = async (values, actions) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { title, labels, isRanked, description, crateAlbums } = values;

    // Create or find the Label records
    const labelPromises = labels.map(async label => {
      if (label.hasOwnProperty('id')) {
        const { data } = await searchLabelsById({ variables: { labelId: label.id } });
        return { ...data.searchLabelsById };
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
        const { data } = await searchTagsById({ variables: { tagId: tag.id } });
        return { ...data.searchTagsById };
      } else {
        const { data } = await addNewTag({ variables: { name: tag.name } });
        return { ...data.addNewTag };
      }
    });
    const crateTags = await Promise.all(tagPromises);

    // Create or find the Album records
    const albumPromises = crateAlbums.map(async album => {
      if (album.hasOwnProperty('id')) {
        const { data } = await searchPrismaAlbumsById({ variables: { albumId: album.id } });
        return { ...data.searchPrismaAlbumsById };
      } else {
        const { data } = await addNewAlbum({ variables: { discogsMasterId: album.discogsMasterId } });
        return { ...data.addNewAlbum };
      }
    });
    const dbCrateAlbums = await Promise.all(albumPromises);

    // Create the new Crate using the above created or connected albums, labels, and tags
    const crateInput = {
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

    const { data } = await addNewCrate({ variables: { input: crateInput } });
    console.log(data);

    actions.resetForm();
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
          <ErrorMessage name="labels" component="div" />
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
