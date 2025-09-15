from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from social.models import Follow
from posts.models import Like, Comment
from server.supabase_client import supabase_client


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    """Create notification when someone follows a user"""
    if created:
        notification = Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            message=f"{instance.follower.username} started following you"
        )
        
        # Sync with Supabase for real-time updates
        try:
            supabase_data = {
                "id": notification.id,
                "recipient_id": notification.recipient.id,
                "sender_id": notification.sender.id,
                "notification_type": notification.notification_type,
                "post_id": notification.post.id if notification.post else None,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
            supabase_client.insert_notification(supabase_data)
        except Exception as e:
            print(f"Error syncing follow notification to Supabase: {e}")


@receiver(post_save, sender=Like)
def create_like_notification(sender, instance, created, **kwargs):
    """Create notification when someone likes a post"""
    if created and instance.post.author != instance.user:
        notification = Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.user,
            notification_type='like',
            post=instance.post,
            message=f"{instance.user.username} liked your post"
        )
        
        # Sync with Supabase for real-time updates
        try:
            supabase_data = {
                "id": notification.id,
                "recipient_id": notification.recipient.id,
                "sender_id": notification.sender.id,
                "notification_type": notification.notification_type,
                "post_id": notification.post.id if notification.post else None,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
            supabase_client.insert_notification(supabase_data)
        except Exception as e:
            print(f"Error syncing like notification to Supabase: {e}")


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """Create notification when someone comments on a post"""
    if created and instance.post.author != instance.author:
        notification = Notification.objects.create(
            recipient=instance.post.author,
            sender=instance.author,
            notification_type='comment',
            post=instance.post,
            message=f"{instance.author.username} commented on your post"
        )
        
        # Sync with Supabase for real-time updates
        try:
            supabase_data = {
                "id": notification.id,
                "recipient_id": notification.recipient.id,
                "sender_id": notification.sender.id,
                "notification_type": notification.notification_type,
                "post_id": notification.post.id if notification.post else None,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
            supabase_client.insert_notification(supabase_data)
        except Exception as e:
            print(f"Error syncing comment notification to Supabase: {e}")
