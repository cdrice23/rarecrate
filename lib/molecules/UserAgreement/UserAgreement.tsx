import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';

const UserAgreement = () => {
  return (
    <Pane>
      <div>
        <h1>{`Rare Crate User Agreement`}</h1>
        <p>{`This User Agreement ("Agreement") governs the use of Rare Crate (the "Application"), provided by RareCrate.co ("we," "us," or "our"). By creating a profile on the Application, you agree to the terms and conditions outlined in this Agreement.`}</p>
      </div>

      <h2>{`1. User Account`}</h2>
      <p>
        {`1.1. `}
        <strong>{`Registration Information: `}</strong>
        {`You agree to provide accurate and complete information during registration.`}
      </p>
      <p>
        {`1.2. `}
        <strong>{`Profile Information: `}</strong>
        {`You may upload profile images and create a username and bio, but you must refrain from generating or sharing objectionable content, including hate speech or derogatory terms, pursuant to section 6.`}
      </p>

      <h2>{`2. User-Generated Content`}</h2>
      <p>
        {`2.1. `}
        <strong>{`Crate, Label, and Tag Content: `}</strong>
        {`You may create collections of music and generate identifying tags ("Labels" and "Tags") within the Application. You are solely responsible for the content you create and any associated tags. Any generated Labels and Tags must be compliant to the rules outlined in section 6.`}
      </p>
      <p>
        {`2.2. `}
        <strong>{`Copyrighted Content: `}</strong>
        {`You affirm that any images you upload to the Application are either original creations owned by you or authorized for use. You agree not to upload any copyrighted images unless you have obtained the necessary rights, licenses, or permissions to do so. Any uploaded images must be compliant to the rules outlined in section 6.`}
      </p>

      <h2>{`3. Data Collection & Usage`}</h2>
      <p>
        {`3.1. `}
        <strong>{`Usage Data: `}</strong>
        {`We may collect and analyze usage data, including trending and user journey behavior, to improve the Application's functionality and user experience. This data will be anonymized and will not contain personally identifiable information.`}
      </p>

      <h2>{`4. Intellectual Property Rights`}</h2>
      <p>
        {`4.1. `}
        <strong>{`Ownership: `}</strong>
        {`All content created or shared by users remains their intellectual property. However, by using the Application, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, and display your content for the purpose of operating and improving the Application.`}
      </p>
      <p>
        {`4.2. `}
        <strong>{`Compliance: `}</strong>
        {`You agree not to infringe upon the intellectual property rights of any third party, including copyrights, trademarks, or other proprietary rights.`}
      </p>

      <h2>{`6. Prohibition of Objectionable Content`}</h2>
      <p>
        {`6.1. `}
        <strong>{`General Prohibition: `}</strong>
        {`You agree not to generate or share any objectionable content within the Application. Objectionable content includes, but is not limited to:`}
      </p>
      <ul>
        <li>{`Hate speech or discriminatory language targeting individuals or groups based on attributes such as race, ethnicity, religion, gender, disability, or sexual orientation.`}</li>
        <li>{`Derogatory or offensive terms directed at individuals or groups.`}</li>
        <li>{`Violent, graphic, or sexually explicit images or content.`}</li>
      </ul>
      <p>
        {`6.2. `}
        <strong>{`Monitoring and Removal: `}</strong>
        {`We reserve the right to monitor user-generated content and remove any content that violates this prohibition.`}
      </p>

      <h2>{`7. Termination of Account`}</h2>
      <p>
        {`7.1. `}
        <strong>{`Ownership: `}</strong>
        {`We reserve the right to terminate or suspend your account at any time and for any reason, including violation of this Agreement.`}
      </p>

      <h2>{`8. Disclaimer of Warranty and Limitation of Liability`}</h2>
      <p>
        {`8.1. `}
        <strong>{`No Warranty: `}</strong>
        {`We provide the Application "as is" without any warranty, express or implied. We do not guarantee the accuracy, completeness, or reliability of the Application.`}
      </p>
      <p>
        {`8.2. `}
        <strong>{`Limitation of Liability: `}</strong>
        {`We shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, data, or other intangible losses.`}
      </p>

      <h2>{`9. Misellaneous`}</h2>
      <p>
        {`8.1. `}
        <strong>{`Entire Agreement: `}</strong>
        {`This Agreement constitutes the entire agreement between you and us regarding your use of the Application.`}
      </p>
      <p>
        {`8.2. `}
        <strong>{`Modifications: `}</strong>
        {`We reserve the right to modify this Agreement at any time. Your continued use of the Application after such modifications constitutes your acceptance of the updated Agreement`}
      </p>

      <p>{`By creating a profile on Rare Crate, you acknowledge that you have read, understood, and agree to abide by the terms and conditions outlined in this User Agreement.`}</p>
      <p>{`If you have any questions or concerns regarding this Agreement, please contact us at support@rarecrate.co`}</p>
    </Pane>
  );
};

export { UserAgreement };
