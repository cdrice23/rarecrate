import * as yup from 'yup';

export const crateFormSchema = yup.object().shape({
  title: yup
    .string()
    .test('maxTitle', 'Your title is too long', val => (val ? val.length < 30 : true))
    .required('Title is required'),
  description: yup
    .string()
    .test('maxDescription', 'Your description is too long', val => (val ? val.length < 160 : true)),
  isRanked: yup.boolean(),
  labels: yup.array().max(5, 'You may not have more than 5 labels on a Crate'),
  crateAlbums: yup
    .array()
    .min(1, 'Please add at least one album')
    .test('rankingValidation', 'Validation error', function (value) {
      const isRanked = this.resolve(yup.ref('isRanked'));
      if (isRanked) {
        // Perform the additional validation rules for isRanked being true
        const orders = value.map(album => album.order);
        const uniqueOrders = new Set(orders);
        if (orders.length !== uniqueOrders.size) {
          return this.createError({
            message: 'Order values should be unique',
            path: 'crateAlbums',
          });
        }

        const expectedRanks = Array.from({ length: value.length }, (_, index) => index + 1);
        const missingRanks = expectedRanks.filter(order => !orders.includes(order));
        if (missingRanks.length > 0) {
          return this.createError({
            message: `Each value must be assigned a unique number between 1 and ${value.length}`,
            path: 'crateAlbums',
          });
        }
      }
      return true;
    })
    .test('tagsValidation', 'Validation error', function (value) {
      if (value) {
        const tagsExceedLimit = value.some(album => (album.tags ? album.tags.length > 5 : null));
        if (tagsExceedLimit) {
          return this.createError({
            message: 'You may not have more than 5 tags on an Album',
            path: 'crateAlbums',
          });
        }
        return true;
      }
    }),
});

export const profileFormSchema = yup.object().shape({
  bio: yup.string().max(150, 'Bio must be a maximum of 150 characters'),
  socialLinks: yup
    .array()
    .of(
      yup.object().shape({
        platform: yup.string().required(),
        username: yup.string().required(),
      }),
    )
    .test(
      'socialLinks',
      `Invalid social media handle(s). Do not include any @ signs in each handle.`,
      function (socialLinks) {
        if (!Array.isArray(socialLinks)) return false;

        for (const socialLink of socialLinks) {
          const { platform, username } = socialLink;

          if (username?.includes('@')) {
            return false;
          }

          switch (platform) {
            case 'TWITTER':
              if (!(username.length >= 4 && username.length <= 15 && /^[a-zA-Z0-9_]+$/.test(username))) {
                return false;
              }
              break;
            case 'INSTAGRAM':
              if (!(username.length >= 1 && username.length <= 30 && /^[a-zA-Z0-9_.]+$/.test(username))) {
                return false;
              }
              break;
            case 'SPOTIFY':
              if (!username || username.trim() === '') {
                return false;
              }
            case 'YOUTUBE':
            case 'DISCOGS':
              if (!(username.length >= 3 && username.length <= 36 && /^[a-zA-Z0-9_.-]+$/.test(username))) {
                return false;
              }
              break;
            default:
              return false;
          }
        }

        return true;
      },
    ),
});
