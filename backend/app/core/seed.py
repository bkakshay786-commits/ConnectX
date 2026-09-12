"""Database Seeder for Development and Demo Accounts."""

import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.profile import Profile
from app.models.settings import UserSettings
from app.core.security import hash_password

logger = logging.getLogger("connectx.seed")

DEMO_USERS = [
    {
        "email": "emily@connectx.social",
        "username": "emily_designs",
        "full_name": "Emily Chen",
        "bio": "Designing spatial interfaces & sharing creative process ✨",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "location": "San Francisco, CA",
        "website": "https://emilychen.design",
        "pronouns": "she/her",
    },
    {
        "email": "alex@connectx.social",
        "username": "alex_3d",
        "full_name": "Alex Rivera",
        "bio": "Lead 3D & Spatial Architect. Crafting realtime shaders and interactive nodes.",
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        "location": "Brooklyn, NY",
        "website": "https://rivera3d.dev",
        "pronouns": "he/him",
    },
    {
        "email": "sarah@connectx.social",
        "username": "sarah_ai",
        "full_name": "Sarah Connor",
        "bio": "Building neural companion experiences and fine-tuned AST code models.",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        "location": "Seattle, WA",
        "website": "https://connor-ai.io",
        "pronouns": "she/her",
    },
    {
        "email": "david@connectx.social",
        "username": "david_cad",
        "full_name": "David Kim",
        "bio": "Hardware & CAD engineer. STEP, IGES, and generative parametric design.",
        "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        "location": "Austin, TX",
        "website": "https://kimcad.com",
        "pronouns": "he/him",
    },
    {
        "email": "maya@connectx.social",
        "username": "maya_vfx",
        "full_name": "Maya Lin",
        "bio": "VFX supervisor & procedural visual effects researcher.",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
        "location": "Toronto, Canada",
        "website": "https://mayavfx.art",
        "pronouns": "they/them",
    },
]


async def seed_demo_data(db: AsyncSession) -> None:
    """Seed baseline demo creators and default accounts if missing."""
    for user_data in DEMO_USERS:
        clean_email = user_data["email"].lower()
        stmt = select(User).where(User.email == clean_email)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            # Update avatar or profile if missing
            if not existing.profile or not existing.profile.avatar_url:
                if existing.profile:
                    existing.profile.avatar_url = user_data["avatar_url"]
                    existing.profile.location = user_data.get("location")
                    existing.profile.website = user_data.get("website")
                    existing.profile.pronouns = user_data.get("pronouns")
            continue

        new_user = User(
            email=clean_email,
            username=user_data["username"],
            username_normalized=user_data["username"].lower(),
            hashed_password=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )
        db.add(new_user)
        await db.flush()

        new_profile = Profile(
            id=new_user.id,
            display_name=user_data["full_name"],
            avatar_url=user_data["avatar_url"],
            bio=user_data["bio"],
            location=user_data.get("location"),
            website=user_data.get("website"),
            pronouns=user_data.get("pronouns"),
            account_visibility="public",
            is_verified=True,
        )
        db.add(new_profile)

        new_settings = UserSettings(
            id=new_user.id,
            pause_all_notifications=False,
            notify_likes=True,
            notify_comments=True,
            notify_spaces=True,
            notify_files=True,
            notify_messages=True,
            theme_mode="obsidian",
            accent_color="violet",
            glow_effects=True,
        )
        db.add(new_settings)

    await db.commit()
    logger.info("Demo users seeded successfully.")
