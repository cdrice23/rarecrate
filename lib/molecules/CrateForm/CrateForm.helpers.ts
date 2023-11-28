import { useRouter } from 'next/router';
import { useMutation, useLazyQuery } from '@apollo/client';
import {
  ADD_NEW_LABEL,
  ADD_NEW_TAG,
  ADD_NEW_ALBUM,
  ADD_NEW_CRATE,
  UPDATE_CRATE,
  GET_CRATE_DETAIL_WITH_ALBUMS,
} from '@/db/graphql/clientOperations/crate';
import { Route } from '@/core/enums/routes';

export const useCrateFormHandlers = (creatorId, crateFormData, onCloseModal) => {
  const [addNewLabel] = useMutation(ADD_NEW_LABEL);
  const [addNewTag] = useMutation(ADD_NEW_TAG);
  const [addNewAlbum] = useMutation(ADD_NEW_ALBUM);
  const [addNewCrate] = useMutation(ADD_NEW_CRATE);
  const [updateCrate] = useMutation(UPDATE_CRATE);
  const [getCrateDetailWithAlbums] = useLazyQuery(GET_CRATE_DETAIL_WITH_ALBUMS, {
    variables: { id: crateFormData?.id },
  });

  const router = useRouter();

  const onSubmit = async (values, actions) => {
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
      // Create new crate and navigate to that created crate
      const { data } = await addNewCrate({ variables: { input: crateInput } });
      console.log(data);
      router.push({
        pathname: Route.Profile + `/${data.addNewCrate.creator.username}`,
        query: { selectedCrate: data.addNewCrate.id },
      });
    }

    getCrateDetailWithAlbums();

    actions.resetForm();
    if (onCloseModal) {
      onCloseModal();
    }
  };

  return {
    onSubmit,
    getCrateDetailWithAlbums,
  };
};

export const initialValues = {
  title: '',
  description: '',
  labels: [],
  isRanked: false,
  crateAlbums: [],
};
