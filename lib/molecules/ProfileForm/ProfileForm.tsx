import { Formik, Field, Form, ErrorMessage } from 'formik';
import cx from 'classnames';
import { SocialLinksInput } from '../SocialLinksInput/SocialLinksInput';
import { profileFormSchema } from '@/core/helpers/validation';
import { useLazyQuery } from '@apollo/client';
import { GET_PROFILE } from '@/db/graphql/clientOperations';
import * as yup from 'yup';

const initialProfileValues = {
  image: '',
  username: '',
  isPrivate: false,
  bio: '',
  socialLinks: {},
};

const ProfileForm = ({ existingProfileData }) => {
  const [getProfile] = useLazyQuery(GET_PROFILE);

  const updatedSchema = yup.object().shape({
    ...profileFormSchema.fields,
    username: yup
      .string()
      .max(30, 'Username must not exceed 30 characters')
      .matches(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, periods, and underscores.')
      .test('unique', 'Username must be unique. Please choose a different username.', async function (inputValue) {
        const isUnique = await (async (inputValue, getProfile) => {
          const { data } = await getProfile({ variables: { username: inputValue } });
          return (
            !data?.getProfile || data.getProfile.username !== inputValue || inputValue === existingProfileData.username
          );
        })(inputValue, getProfile);
        return isUnique;
      }),
  });

  const onSubmit = async (values, actions) => {
    console.log(values);
  };

  return (
    <Formik
      initialValues={existingProfileData ? existingProfileData : initialProfileValues}
      validationSchema={updatedSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className={cx('pane')}>
          <div className={cx('paneSectionFull')}>
            <h3 className={cx('sectionTitle')}>{`Edit Profile:`}</h3>
            {/* <div className={cx('formInputItem')}>
              <label htmlFor="image">Image URL</label>
              <Field name="image" type="text" />
            </div> */}
            <div className={cx('formInputItem')}>
              <label htmlFor="username">Username</label>
              <Field name="username" type="text" />
              <ErrorMessage name="username" component="div" />
            </div>
            <div className={cx('formInputItem')}>
              <label htmlFor="isPrivate">Private account?</label>
              <Field name="isPrivate" type="checkbox" />
              {!values.isPrivate && (
                <p>
                  <em>{`Note: any pending follow requests will be accepted when you switch your profile to public.`}</em>
                </p>
              )}
            </div>
            <div className={cx('formInputItem')}>
              <label htmlFor="bio">Bio</label>
              <Field name="bio" as="textarea" className={cx('formInputLongText')} />
              <ErrorMessage name="bio" component="div" />
            </div>
            <SocialLinksInput socialLinks={values.socialLinks} setFieldValue={setFieldValue} />
            <ErrorMessage name="socialLinks" component="div" />
            <button type="submit">Submit</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export { ProfileForm };
