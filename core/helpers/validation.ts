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
});
