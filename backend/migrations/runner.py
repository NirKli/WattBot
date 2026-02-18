import importlib
import pkgutil
import backend.migrations as migrations_pkg


def run_data_migrations(db):
    modules = [
        module_name
        for _, module_name, _ in pkgutil.iter_modules(migrations_pkg.__path__)
        if module_name != "runner"
    ]

    # Sort by filename (timestamp prefix)
    for module_name in sorted(modules):
        module = importlib.import_module(f"backend.migrations.{module_name}")

        if hasattr(module, "run") and hasattr(module, "MIGRATION_ID"):
            module.run(db)
