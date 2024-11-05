resource "azurerm_cosmosdb_account" "cosmosdb_acc" {
  location = "northeurope"
  name = "cosmosdb-products-service-sand-ne"
  offer_type = "Standard"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  kind = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Eventual"
  }

  capabilities {
    name = "EnableServerless"
  }

  geo_location {
    failover_priority = 0
    location = "North Europe"
  }
}

resource "azurerm_cosmosdb_sql_database" "products_app" {
  account_name = azurerm_cosmosdb_account.cosmosdb_acc.name
  name = "products-db"
  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_cosmosdb_sql_container" "products" {
  account_name = azurerm_cosmosdb_account.cosmosdb_acc.name
  database_name = azurerm_cosmosdb_sql_database.products_app.name
  name = "products"
  partition_key_path = "/id"
  partition_key_version = 1
  resource_group_name = azurerm_resource_group.product_service_rg.name

  #Cosmos DB supports TTL for the records
  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "stocks" {
  name = "stocks"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  account_name = azurerm_cosmosdb_account.cosmosdb_acc.name
  database_name = azurerm_cosmosdb_sql_database.products_app.name
  partition_key_path = "/product_id"
  partition_key_version = 1

  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}
