import { Formik, Field, Form } from 'formik';
import cx from 'classnames';
import { SocialLinksInput } from '../SocialLinksInput/SocialLinksInput';

const initialProfileValues = {
  image: '',
  username: '',
  isPrivate: false,
  bio: '',
  socialLinks: {},
};

const ProfileForm = ({ existingProfileData }) => {
  const onSubmit = async (values, actions) => {
    console.log(values);
  };
  return (
    <Formik initialValues={existingProfileData ? existingProfileData : initialProfileValues} onSubmit={onSubmit}>
      {({ values, setFieldValue }) => (
        <Form className={cx('pane')}>
          <div className={cx('paneSectionFull')}>
            <h3 className={cx('sectionTitle')}>{`Edit Profile:`}</h3>
            <div className={cx('formInputItem')}>
              <label htmlFor="image">Image URL</label>
              <Field name="image" type="text" />
            </div>
            <div className={cx('formInputItem')}>
              <label htmlFor="username">Username</label>
              <Field name="username" type="text" />
            </div>
            <div className={cx('formInputItem')}>
              <label htmlFor="isPrivate">Private account?</label>
              <Field name="isPrivate" type="checkbox" />
            </div>
            <div className={cx('formInputItem')}>
              <label htmlFor="bio">Bio</label>
              <Field name="bio" as="textarea" className={cx('formInputLongText')} />
            </div>
            <SocialLinksInput socialLinks={values.socialLinks} setFieldValue={setFieldValue} />
            <button type="submit">Submit</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export { ProfileForm };
