import cx from 'classnames';
import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { User as UserIcon, Camera } from '@phosphor-icons/react';
import { PublicRoute } from '@/core/enums/routes';
import { useLocalState } from '@/lib/context/state';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { ProfileFormProps } from '@/lib/molecules/ProfileForm/ProfileForm.types';
import { GET_PROFILE } from '@/db/graphql/clientOperations/profile';
import { UserAgreement } from '../UserAgreement/UserAgreement';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import { SocialLinksArrayInput } from '../SocialLinksArrayInput/SocialLinksArrayInput';
import { EditProfilePic } from '../EditProfilePic/EditProfilePic';
import { initialProfileValues, updatedSchema, useMutations, onSubmit } from './ProfileForm.helpers';

const ProfileForm = ({
  existingProfileData,
  userId,
  setShowEditProfile,
  imageRefreshKey,
  setImageRefreshKey,
}: ProfileFormProps) => {
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showEditPic, setShowEditPic] = useState<boolean>(false);
  const { setUsernameMain, setProfileIdMain } = useLocalState();
  const [getProfile] = useLazyQuery(GET_PROFILE);
  const { updateProfile, autoAcceptFollowRequests, createNewProfile, acceptUserAgreement } = useMutations();

  const currentUser = userId;

  const router = useRouter();

  return (
    <Formik
      initialValues={existingProfileData ? existingProfileData : initialProfileValues}
      validationSchema={updatedSchema(getProfile, existingProfileData)}
      onSubmit={async (values, actions) => {
        await onSubmit(
          values,
          actions,
          updateProfile,
          autoAcceptFollowRequests,
          createNewProfile,
          acceptUserAgreement,
          setUsernameMain,
          setShowEditProfile,
          currentUser,
          router,
          setProfileIdMain,
        );
      }}
    >
      {({ values, setFieldValue, isSubmitting, initialValues }) => {
        return (
          <Form className={cx('pane')}>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Edit Profile:`}</h3>
              <div className={cx('formInputHead')}>
                <div className={cx('imageContainer')}>
                  <div className={cx('image')}>
                    {values.image && values.username ? (
                      <ProfilePic key={Number(imageRefreshKey)} username={values.username} size={75} />
                    ) : (
                      <UserIcon size={32} />
                    )}
                  </div>
                  <button
                    className={cx('editPic')}
                    type="button"
                    onClick={() => {
                      setShowEditPic(true);
                    }}
                  >
                    <span>{`Edit `}</span>
                    <Camera />
                  </button>
                </div>

                <div className={cx('formInputHeadItems')}>
                  <div className={cx('formInputItem')}>
                    <label htmlFor="username">Username</label>
                    <Field name="username" type="text" />
                    <ErrorMessage name="username" component="div" />
                  </div>
                  <div className={cx('formInputItem')}>
                    <label htmlFor="isPrivate">Private account?</label>
                    <Field name="isPrivate" type="checkbox" />
                    {!values.isPrivate && initialValues.isPrivate && existingProfileData && (
                      <p>
                        <em>{`Note: any pending follow requests will be accepted when you switch your profile to public.`}</em>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Modal
                content={
                  <EditProfilePic
                    profileData={{ username: values.username, id: values.id }}
                    onClose={() => {
                      setShowEditPic(false);
                    }}
                    imageRefreshKey={imageRefreshKey}
                    setImageRefreshKey={setImageRefreshKey}
                  />
                }
                title={`Edit Profile Pic`}
                show={showEditPic}
                onClose={() => {
                  setShowEditPic(false);
                }}
              />
              <div className={cx('formInputItem')}>
                <label htmlFor="bio">Bio</label>
                <Field name="bio" as="textarea" className={cx('formInputLongText')} />
                <ErrorMessage name="bio" component="div" />
              </div>
              <SocialLinksArrayInput socialLinks={values.socialLinks} setFieldValue={setFieldValue} />
              <ErrorMessage name="socialLinks" component="div" />
              {!existingProfileData && (
                <div className={cx('formInputItem')}>
                  <div>
                    <Field name="acceptUserAgreement" type="checkbox" />
                    <label htmlFor="acceptUserAgreement">{`I accept the terms of the user agreement.`}</label>
                  </div>
                  <ErrorMessage name="acceptUserAgreement" component="div" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowTerms(true);
                    }}
                  >{`Show Terms & Conditions`}</button>
                  <Modal
                    content={<UserAgreement />}
                    title={`Terms & Conditions`}
                    show={showTerms}
                    onClose={() => {
                      setShowTerms(false);
                    }}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !values.socialLinks.every(link => link.platform && link.username)}
              >
                Submit
              </button>
              <button
                onClick={() => {
                  if (existingProfileData) {
                    setShowEditProfile(false);
                  } else {
                    router.push(PublicRoute.Logout);
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export { ProfileForm };
