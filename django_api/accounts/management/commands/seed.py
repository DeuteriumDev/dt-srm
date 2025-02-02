from django.core.management.base import BaseCommand, CommandError
from django.contrib.contenttypes.models import ContentType
from kits.models import Folder, Kit, Question, Answer
from accounts.models import CustomGroup, CustomUser, CustomPermissions, Organization


class Command(BaseCommand):
    help = "Seed db with basic user & docs"

    def handle(self, *args, **kwargs):
        user = CustomUser.objects.create(
            email="pbateman@test.ca",
            first_name="Patrick",
            last_name="Bateman",
        )
        user.set_password("test")
        user.save()

        group = CustomGroup.objects.create(name="test group 1")
        group.members.add(user)
        group.save()

        folder = Folder.objects.create(name="test folder 1", favorite=True)
        folder.save()
        answer = Answer.objects.create(title="answer 1")
        answer.save()
        question = Question.objects.create(title="question 1")
        question.answers.add(answer)
        question.save()
        Kit.objects.create(title="test kit 1", parent=folder, start=question).save()

        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(Folder),
            object_id=folder.id,
            group=group,
        ).save()
        org = Organization.objects.create(name="test org 1")
        org.root = group
        org.save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded db"))
