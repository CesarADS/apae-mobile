package br.apae.ged.presentation.configs;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Configuration
public class SwaggerConfigs {

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Bean
    public OpenAPI openApiConfigurer(){
        Info information = new Info()
                .title("API Gerenciadora de Arquivos")
                .version("1.0")
                .description("Esta API expõe endpoints para uso de um gerenciador de arquivos");

        return new OpenAPI()
                .servers(List.of(new Server().url(contextPath)))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                ))
                .info(information);
    }
}
