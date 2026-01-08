// Cloudinary upload utility
export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured. Please check your .env file.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      const errorMessage = error.error?.message || 'Failed to upload image'
      
      // Provide helpful error messages
      if (errorMessage.includes('preset') || errorMessage.includes('Upload preset') || response.status === 400) {
        throw new Error(
          `Upload preset "${uploadPreset}" not found in your Cloudinary account.\n\n` +
          `To fix this:\n` +
          `1. Go to https://console.cloudinary.com/settings/upload\n` +
          `2. Click "Add upload preset"\n` +
          `3. Name it "${uploadPreset}" (or any name you prefer)\n` +
          `4. Set it to "Unsigned" mode\n` +
          `5. Save and update VITE_CLOUDINARY_UPLOAD_PRESET in your .env file\n` +
          `6. Restart your dev server`
        )
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.secure_url // Return the uploaded image URL
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

