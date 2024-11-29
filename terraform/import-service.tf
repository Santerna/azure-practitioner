resource "azurerm_resource_group" "import_service_rg" {
  location = "northeurope"
  name = "fa-import-service-sand-ne-001"
}

resource "azurerm_storage_account" "import_service_fa" {
  name = "devsandimportfane002"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier = "Standard"
  account_kind = "StorageV2"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_container" "uploaded" {
  name = "uploaded"
  storage_account_name = azurerm_storage_account.import_service_fa.name
  container_access_type = "blob"
}

resource "azurerm_storage_container" "parsed" {
  name = "parsed"
  storage_account_name = azurerm_storage_account.import_service_fa.name
  container_access_type = "blob"
}

resource "azurerm_storage_share" "import_service_fa" {
  name = "fa-import-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.import_service_fa.name
}

resource "azurerm_service_plan" "import_service_plan" {
  name = "asp-import-service-sand-ne-001"
  location = "northeurope"

  os_type = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}
resource "azurerm_application_insights" "import_service_fa" {
  name = "appins-fa-import-service-sand-ne-001"
  application_type = "web"
  location = "northeurope"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}


resource "azurerm_windows_function_app" "import-service-rg" {
  name     = "fa-import-service-sand-ne-0011"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.import_service_plan.id
  resource_group_name = azurerm_resource_group.import_service_rg.name

  storage_account_name       = azurerm_storage_account.import_service_fa.name
  storage_account_access_key = azurerm_storage_account.import_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.import_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_fa.connection_string

    # For production systems set this to false
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      site_config["application_stack"],
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}