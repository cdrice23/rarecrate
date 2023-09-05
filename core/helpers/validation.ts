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
  crateAlbums: yup
    .array()
    .min(1, 'Please add at least one album')
    .test('customValidation', 'Validation error', function (value) {
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
        console.log(expectedRanks);
        if (missingRanks.length > 0) {
          return this.createError({
            message: `Each value must be assigned a unique number between 1 and ${value.length}`,
            path: 'crateAlbums',
          });
        }
      }
      return true;
    }),
});
