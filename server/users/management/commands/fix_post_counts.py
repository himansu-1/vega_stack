from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix post counts for all users by counting actual posts'

    def handle(self, *args, **options):
        self.stdout.write('Fixing post counts...')
        
        users = User.objects.all()
        fixed_count = 0
        
        for user in users:
            actual_count = Post.objects.filter(author=user, is_active=True).count()
            if user.posts_count != actual_count:
                self.stdout.write(
                    f'User {user.username}: {user.posts_count} -> {actual_count}'
                )
                user.posts_count = actual_count
                user.save()
                fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} users')
        )
