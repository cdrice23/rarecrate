import { SocialPlatform } from '@/core/enums/database';
import { Field, FieldArray } from 'formik';
import cx from 'classnames';
import { X, Check, Plus } from '@phosphor-icons/react';
import { useState } from 'react';

const SocialLinksInput = ({ socialLinks, setFieldValue }) => {
  const [showAddLink, setShowAddLink] = useState<boolean>(false);
  const [newSocialLink, setNewSocialLink] = useState<{ platform: SocialPlatform; username: string }>(null);

  const handlePlatformChange = event => {
    setNewSocialLink({ ...newSocialLink, platform: event.target.value });
  };

  const handleUsernameChange = event => {
    setNewSocialLink({ ...newSocialLink, username: event.target.value });
  };

  return (
    <>
      <label htmlFor="socialLinks">Social Links</label>
      <FieldArray name="socialLinks">
        {({ push, remove }) => (
          <div>
            {socialLinks.map((socialLink, index) => (
              <div key={index}>
                <p>{socialLink.platform}</p>
                <p>{socialLink.username}</p>
                <button type="button" onClick={() => remove(index)}>
                  <X />
                </button>
              </div>
            ))}
            {showAddLink && (
              <div>
                <select name="socialLinkPlatform" onChange={handlePlatformChange}>
                  <option value="">Social Platform:</option>
                  {Object.keys(SocialPlatform)
                    .filter(key => isNaN(Number(key)))
                    .map(key => (
                      <option key={SocialPlatform[key]} value={key}>
                        {key}
                      </option>
                    ))}
                </select>
                <Field name={'socialLinkUsername'} type="text" placeholder="Username" onChange={handleUsernameChange} />
                <button
                  type="button"
                  onClick={() => {
                    push(newSocialLink);
                    setShowAddLink(false);
                  }}
                >
                  <Check />
                </button>
              </div>
            )}
            <button type="button" onClick={() => setShowAddLink(true)}>
              <Plus />
            </button>
          </div>
        )}
      </FieldArray>
    </>
  );
};

export { SocialLinksInput };
