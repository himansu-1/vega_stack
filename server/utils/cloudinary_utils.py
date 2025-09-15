import cloudinary.uploader
import cloudinary.api
import logging

logger = logging.getLogger(__name__)

def delete_cloudinary_image(image_url):
    """
    Delete an image from Cloudinary using its URL
    """
    if not image_url:
        return False
    
    try:
        # Extract public_id from the URL
        # Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        if 'cloudinary.com' in image_url:
            # Split the URL to get the public_id
            parts = image_url.split('/')
            if len(parts) >= 8:
                # Find the index of 'upload' and get the next part (version)
                upload_index = parts.index('upload')
                if upload_index + 1 < len(parts):
                    # The public_id is everything after the version
                    public_id_with_format = parts[upload_index + 2]
                    # Remove the file extension
                    public_id = public_id_with_format.split('.')[0]
                    
                    # Delete the image
                    result = cloudinary.uploader.destroy(public_id)
                    logger.info(f"Deleted image from Cloudinary: {public_id}, result: {result}")
                    return result.get('result') == 'ok'
        
        logger.warning(f"Could not extract public_id from URL: {image_url}")
        return False
        
    except Exception as e:
        logger.error(f"Error deleting image from Cloudinary: {str(e)}")
        return False

def extract_public_id_from_url(image_url):
    """
    Extract public_id from Cloudinary URL
    """
    if not image_url or 'cloudinary.com' not in image_url:
        return None
    
    try:
        parts = image_url.split('/')
        upload_index = parts.index('upload')
        if upload_index + 1 < len(parts):
            public_id_with_format = parts[upload_index + 2]
            return public_id_with_format.split('.')[0]
    except Exception as e:
        logger.error(f"Error extracting public_id: {str(e)}")
    
    return None
