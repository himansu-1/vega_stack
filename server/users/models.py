from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from utils.cloudinary_utils import delete_cloudinary_image

class User(AbstractUser):
    ROLE_CHOICES = (('admin', 'Admin'), ('user', 'User'))

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    bio = models.CharField(max_length=160, blank=True)

    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)
    posts_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'role']
    USERNAME_FIELD = 'username'

    def __str__(self):
        return self.username

@receiver(pre_delete, sender=User)
def delete_user_avatar(sender, instance, **kwargs):
    """
    Delete user's avatar from Cloudinary when user is deleted
    """
    if instance.avatar_url:
        delete_cloudinary_image(instance.avatar_url)
