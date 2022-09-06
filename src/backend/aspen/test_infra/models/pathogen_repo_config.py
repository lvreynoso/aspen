from aspen.database.models import Pathogen, PathogenRepoConfig, PublicRepository


async def setup_gisaid_and_genbank_repo_configs(async_session):
    repo_info = {
        "GISAID": {"prefix": "hCoV-19"},
        "GenBank": {"prefix": "SARS-CoV-2/human"},
    }

    pathogen = await Pathogen.get_by_slug(async_session, "SC2")
    for name, config in repo_info.items():
        public_repository = PublicRepository(name=name)
        async_session.add(public_repository)
        pathogen_repo_config = pathogen_repo_config_factory(
            config["prefix"], pathogen, public_repository
        )
        async_session.add(pathogen_repo_config)


def pathogen_repo_config_factory(prefix, pathogen, public_repository):
    pathogen_repo_config = PathogenRepoConfig(
        prefix=prefix, pathogen=pathogen, public_repository=public_repository
    )

    return pathogen_repo_config
