import { useState } from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { createUploadWidget } from '@cloudinary/react';

const ImageUploader = () => {
  const [imageId, setImageId] = useState('');

  const uploadWidget = createUploadWidget(
    {
      cloudName: 'dkf2bb8xv',
      uploadPreset: 'hmmm' 
    },
    (error, result) => {
      if (!error && result.event === 'success') {
        setImageId(result.info.public_id);
      }
    }
  );

  return (
    <div>
      <button onClick={() => uploadWidget.open()}>
        Upload Image
      </button>
      {imageId && (
        <AdvancedImage 
          cldImg={cld.image(imageId)} 
          width="300"
        />
      )}
    </div>
  );
};

export default ImageUploader;